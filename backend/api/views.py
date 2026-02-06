from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.http import HttpResponse
from .models import Dataset, Equipment
from .serializers import DatasetSerializer, DatasetDetailSerializer, EquipmentSerializer
import json

class UploadView(APIView):
    def post(self, request, format=None):
        if 'file' not in request.FILES:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        data_list = []
        try:
            # Try parsing with pandas if available, otherwise use csv module
            try:
                import pandas as pd
                df = pd.read_csv(file)
                # Basic validation
                required_columns = ['Equipment Name', 'Type', 'Flowrate', 'Pressure', 'Temperature']
                if not all(col in df.columns for col in required_columns):
                    return Response({'error': f'CSV must contain columns: {", ".join(required_columns)}'}, 
                                   status=status.HTTP_400_BAD_REQUEST)
                
                data_list = df.to_dict('records')
                # Recalculate summary from dicts for consistency
                summary = {
                    'total_count': len(df),
                    'avg_flowrate': float(df['Flowrate'].mean()),
                    'avg_pressure': float(df['Pressure'].mean()),
                    'avg_temperature': float(df['Temperature'].mean()),
                    'type_distribution': df['Type'].value_counts().to_dict()
                }
            except (ImportError, ModuleNotFoundError):
                # Fallback to csv module
                import csv
                import io
                file_content = file.read().decode('utf-8')
                file.seek(0)
                reader = csv.DictReader(io.StringIO(file_content))
                
                # Column mapping for inconsistencies in headers
                fieldnames = reader.fieldnames
                col_map = {col: col for col in fieldnames}
                req = ['Equipment Name', 'Type', 'Flowrate', 'Pressure', 'Temperature']
                
                if not all(any(r.lower() == f.lower() for f in fieldnames) for r in req):
                    return Response({'error': f'CSV must contain columns: {", ".join(req)}'}, 
                                   status=status.HTTP_400_BAD_REQUEST)

                rows = list(reader)
                data_list = []
                totals = {'Flowrate': 0.0, 'Pressure': 0.0, 'Temperature': 0.0}
                type_counts = {}
                
                for row in rows:
                    try:
                        # Extract and convert values
                        # Find matching keys regardless of case
                        def get_val(key):
                            for k in row.keys():
                                if k.lower() == key.lower(): return row[k]
                            return "0"

                        eq_name = get_val('Equipment Name')
                        eq_type = get_val('Type')
                        flow = float(get_val('Flowrate'))
                        press = float(get_val('Pressure'))
                        temp = float(get_val('Temperature'))
                        
                        data_list.append({
                            'Equipment Name': eq_name,
                            'Type': eq_type,
                            'Flowrate': flow,
                            'Pressure': press,
                            'Temperature': temp
                        })
                        
                        totals['Flowrate'] += flow
                        totals['Pressure'] += press
                        totals['Temperature'] += temp
                        type_counts[eq_type] = type_counts.get(eq_type, 0) + 1
                    except ValueError:
                        continue
                
                count = len(data_list)
                if count == 0:
                    return Response({'error': 'No valid data found in CSV'}, status=status.HTTP_400_BAD_REQUEST)
                
                summary = {
                    'total_count': count,
                    'avg_flowrate': totals['Flowrate'] / count,
                    'avg_pressure': totals['Pressure'] / count,
                    'avg_temperature': totals['Temperature'] / count,
                    'type_distribution': type_counts
                }

            # Create Dataset
            dataset = Dataset.objects.create(
                name=file.name,
                row_count=len(data_list),
                summary_json=json.dumps(summary)
            )

            # Create Equipment records
            equipment_objects = []
            for row in data_list:
                equipment_objects.append(Equipment(
                    dataset=dataset,
                    equipment_name=row['Equipment Name'],
                    equipment_type=row['Type'],
                    flowrate=row['Flowrate'],
                    pressure=row['Pressure'],
                    temperature=row['Temperature']
                ))
            Equipment.objects.bulk_create(equipment_objects)

            # Limit history to 5 datasets
            if Dataset.objects.count() > 5:
                to_delete = Dataset.objects.all().order_by('-upload_time')[5:]
                Dataset.objects.filter(id__in=[d.id for d in to_delete]).delete()

            return Response(DatasetSerializer(dataset).data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DatasetListView(generics.ListAPIView):
    queryset = Dataset.objects.all()[:5]
    serializer_class = DatasetSerializer

class DatasetDetailView(generics.RetrieveAPIView):
    queryset = Dataset.objects.all()
    serializer_class = DatasetDetailSerializer

class PDFReportView(APIView):
    def get(self, request, pk, format=None):
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        from io import BytesIO
        try:
            dataset = Dataset.objects.get(pk=pk)
            summary = dataset.get_summary()
            
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=letter)
            p.drawString(100, 750, f"Chemical Equipment Parameter Report: {dataset.name}")
            p.drawString(100, 730, f"Upload Time: {dataset.upload_time.strftime('%Y-%m-%d %H:%M:%S')}")
            p.drawString(100, 710, f"Total Equipment: {dataset.row_count}")
            
            p.drawString(100, 680, "Summary Statistics:")
            p.drawString(120, 660, f"Average Flowrate: {summary['avg_flowrate']:.2f}")
            p.drawString(120, 640, f"Average Pressure: {summary['avg_pressure']:.2f}")
            p.drawString(120, 620, f"Average Temperature: {summary['avg_temperature']:.2f}")
            
            p.drawString(100, 590, "Type Distribution:")
            y = 570
            for eq_type, count in summary['type_distribution'].items():
                p.drawString(120, y, f"{eq_type}: {count}")
                y -= 20
                if y < 50:
                    p.showPage()
                    y = 750

            p.showPage()
            p.save()
            
            buffer.seek(0)
            return HttpResponse(buffer, content_type='application/pdf')
        except Dataset.DoesNotExist:
            return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)
