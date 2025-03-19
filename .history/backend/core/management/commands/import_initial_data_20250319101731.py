import json
from django.core.management.base import BaseCommand
from core.models import Refinery, DashboardSettings
from django.utils import timezone

class Command(BaseCommand):
    help = 'Import initial data from a JSON file'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str, help='Path to the JSON file')

    def handle(self, *args, **options):
        json_file = options['json_file']
        
        try:
            with open(json_file, 'r', encoding='utf-8') as file:
                data = json.load(file)
                
                # Import refineries
                if 'refineries' in data and isinstance(data['refineries'], list):
                    count = 0
                    for refinery_data in data['refineries']:
                        # Extract coordinates
                        coordinates = refinery_data.get('coordinates', [0, 0])
                        latitude = coordinates[0] if len(coordinates) > 0 else 0
                        longitude = coordinates[1] if len(coordinates) > 1 else 0
                        
                        # Map status to choices (normalize the data)
                        status_mapping = {
                            # French values
                            'Opérationnel': 'operational',
                            'En construction': 'construction',
                            'Planifié': 'planned',
                            'Approuvé': 'approved',
                            'En pause': 'suspended',
                            # English values - already normalized
                            'operational': 'operational',
                            'construction': 'construction',
                            'planned': 'planned',
                            'approved': 'approved',
                            'suspended': 'suspended'
                        }
                        
                        status_value = refinery_data.get('status', 'planned')
                        status = status_mapping.get(status_value, status_value)
                        
                        # Print debug info
                        self.stdout.write(f"Processing refinery: {refinery_data.get('name')} with status {status_value} -> {status}")
                        
                        # Create or update the refinery
                        refinery, created = Refinery.objects.update_or_create(
                            id=refinery_data.get('id'),
                            defaults={
                                'name': refinery_data.get('name', ''),
                                'location': refinery_data.get('location', ''),
                                'country': refinery_data.get('country', 'Canada'),
                                'latitude': latitude,
                                'longitude': longitude,
                                'status': status,
                                'production': refinery_data.get('production', ''),
                                'processing': refinery_data.get('processing', ''),
                                'notes': refinery_data.get('notes', ''),
                                'website': refinery_data.get('website', '')
                            }
                        )
                        
                        if created:
                            count += 1
                    
                    self.stdout.write(self.style.SUCCESS(f'Successfully imported {count} refineries'))
                
                # Import dashboard settings
                if 'status_colors' in data and 'chart_colors' in data:
                    # Use status colors directly if they're already in the right format
                    # or map them if they're in French
                    status_colors_normalized = {}
                    for key, value in data['status_colors'].items():
                        if key in ['operational', 'construction', 'planned', 'approved', 'suspended']:
                            # Already normalized
                            status_colors_normalized[key] = value
                        elif key == 'Opérationnel':
                            status_colors_normalized['operational'] = value
                        elif key == 'En construction':
                            status_colors_normalized['construction'] = value
                        elif key == 'Planifié':
                            status_colors_normalized['planned'] = value
                        elif key == 'Approuvé':
                            status_colors_normalized['approved'] = value
                        elif key in ['En pause', 'En suspens']:
                            status_colors_normalized['suspended'] = value
                    
                    # Create or update dashboard settings
                    settings, created = DashboardSettings.objects.update_or_create(
                        id=1,  # Assuming we only have one settings object
                        defaults={
                            'version': data.get('version', timezone.now().strftime('%Y-%m-%d')),
                            'status_colors': status_colors_normalized or data['status_colors'],
                            'chart_colors': data['chart_colors']
                        }
                    )
                    
                    self.stdout.write(self.style.SUCCESS('Successfully imported dashboard settings'))
        
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'File {json_file} not found'))
        except json.JSONDecodeError:
            self.stdout.write(self.style.ERROR(f'Invalid JSON in {json_file}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing data: {str(e)}'))