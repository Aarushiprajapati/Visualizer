import sys
import os
import requests
import json
import pandas as pd
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
                             QPushButton, QFileDialog, QTableWidget, QTableWidgetItem, 
                             QLabel, QTabWidget, QMessageBox, QHeaderView)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont, QIcon
import matplotlib.pyplot as plt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure

API_BASE_URL = "http://127.0.0.1:8000/api"

class ChartWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.figure = Figure(figsize=(8, 6), dpi=100)
        self.canvas = FigureCanvas(self.figure)
        layout = QVBoxLayout()
        layout.addWidget(self.canvas)
        self.setLayout(layout)

    def plot_summary(self, summary):
        self.figure.clear()
        
        # Pie chart for distribution
        ax1 = self.figure.add_subplot(121)
        labels = list(summary['type_distribution'].keys())
        sizes = list(summary['type_distribution'].values())
        ax1.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=140)
        ax1.set_title("Type Distribution")

        # Bar chart for averages
        ax2 = self.figure.add_subplot(122)
        metrics = ['Flowrate', 'Pressure', 'Temp']
        values = [summary['avg_flowrate'], summary['avg_pressure'], summary['avg_temperature']]
        ax2.bar(metrics, values, color=['skyblue', 'lightgreen', 'salmon'])
        ax2.set_title("Average Parameters")

        self.canvas.draw()

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("ChemViz Pro - Desktop Analytics")
        self.resize(1000, 700)
        self.setStyleSheet("""
            QMainWindow { background-color: #f8fafc; }
            QPushButton { 
                background-color: #2563eb; color: white; border-radius: 8px; 
                padding: 10px 20px; font-weight: bold; border: none;
            }
            QPushButton:hover { background-color: #1d4ed8; }
            QPushButton#secondary { background-color: #e2e8f0; color: #475569; }
            QTableWidget { border: 1px solid #e2e8f0; border-radius: 8px; background-color: white; }
            QHeaderView::section { background-color: #f1f5f9; padding: 4px; border: 1px solid #e2e8f0; font-weight: bold; }
        """)

        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.layout = QVBoxLayout(self.central_widget)

        # Header
        self.header_layout = QHBoxLayout()
        self.title_label = QLabel("ChemViz Pro")
        self.title_label.setFont(QFont("Inter", 20, QFont.Bold))
        self.header_layout.addWidget(self.title_label)
        
        self.upload_btn = QPushButton("Upload CSV")
        self.upload_btn.clicked.connect(self.upload_file)
        self.header_layout.addStretch()
        self.header_layout.addWidget(self.upload_btn)
        
        self.layout.addLayout(self.header_layout)

        # Tabs
        self.tabs = QTabWidget()
        self.data_tab = QWidget()
        self.chart_tab = QWidget()
        self.history_tab = QWidget()
        
        self.tabs.addTab(self.data_tab, "Equipment Data")
        self.tabs.addTab(self.chart_tab, "Analytics Charts")
        self.tabs.addTab(self.history_tab, "Upload History")
        
        self.layout.addWidget(self.tabs)

        self.setup_data_tab()
        self.setup_chart_tab()
        self.setup_history_tab()

        self.load_history()

    def setup_data_tab(self):
        layout = QVBoxLayout(self.data_tab)
        self.table = QTableWidget()
        self.table.setColumnCount(5)
        self.table.setHorizontalHeaderLabels(["Name", "Type", "Flowrate", "Pressure", "Temp"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        layout.addWidget(self.table)

    def setup_chart_tab(self):
        layout = QVBoxLayout(self.chart_tab)
        self.chart_widget = ChartWidget()
        layout.addWidget(self.chart_widget)

    def setup_history_tab(self):
        layout = QVBoxLayout(self.history_tab)
        self.history_table = QTableWidget()
        self.history_table.setColumnCount(4)
        self.history_table.setHorizontalHeaderLabels(["ID", "Filename", "Date", "Action"])
        self.history_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        layout.addWidget(self.history_table)

    def upload_file(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Open CSV", "", "CSV Files (*.csv)")
        if file_path:
            with open(file_path, 'rb') as f:
                files = {'file': f}
                try:
                    response = requests.post(f"{API_BASE_URL}/upload/", files=files)
                    if response.status_code == 201:
                        data = response.json()
                        QMessageBox.information(self, "Success", f"Uploaded successfully: {data['name']}")
                        self.load_dataset_details(data['id'])
                        self.load_history()
                    else:
                        QMessageBox.warning(self, "Error", response.json().get('error', 'Upload failed'))
                except Exception as e:
                    QMessageBox.critical(self, "Connection Error", str(e))

    def load_dataset_details(self, dataset_id):
        try:
            response = requests.get(f"{API_BASE_URL}/datasets/{dataset_id}/")
            if response.status_code == 200:
                data = response.json()
                self.update_table(data['equipment'])
                self.chart_widget.plot_summary(data['summary'])
                self.tabs.setCurrentIndex(0)
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Could not fetch details: {str(e)}")

    def update_table(self, equipment):
        self.table.setRowCount(len(equipment))
        for i, eq in enumerate(equipment):
            self.table.setItem(i, 0, QTableWidgetItem(eq['equipment_name']))
            self.table.setItem(i, 1, QTableWidgetItem(eq['equipment_type']))
            self.table.setItem(i, 2, QTableWidgetItem(str(eq['flowrate'])))
            self.table.setItem(i, 3, QTableWidgetItem(str(eq['pressure'])))
            self.table.setItem(i, 4, QTableWidgetItem(str(eq['temperature'])))

    def load_history(self):
        try:
            response = requests.get(f"{API_BASE_URL}/datasets/")
            if response.status_code == 200:
                datasets = response.json()
                self.history_table.setRowCount(len(datasets))
                for i, ds in enumerate(datasets):
                    self.history_table.setItem(i, 0, QTableWidgetItem(str(ds['id'])))
                    self.history_table.setItem(i, 1, QTableWidgetItem(ds['name']))
                    self.history_table.setItem(i, 2, QTableWidgetItem(ds['upload_time']))
                    
                    btn = QPushButton("View")
                    btn.setObjectName("secondary")
                    btn.clicked.connect(lambda checked, id=ds['id']: self.load_dataset_details(id))
                    self.history_table.setCellWidget(i, 3, btn)
        except Exception as e:
            print(f"History error: {e}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())
