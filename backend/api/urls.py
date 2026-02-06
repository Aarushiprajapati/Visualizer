from django.urls import path
from .views import UploadView, DatasetListView, DatasetDetailView, PDFReportView

urlpatterns = [
    path('upload/', UploadView.as_view(), name='upload'),
    path('datasets/', DatasetListView.as_view(), name='dataset-list'),
    path('datasets/<int:pk>/', DatasetDetailView.as_view(), name='dataset-detail'),
    path('datasets/<int:pk>/pdf/', PDFReportView.as_view(), name='pdf-report'),
]
