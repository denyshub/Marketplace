import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'online_shop.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

if not User.objects.filter(is_superuser=True).exists():
    username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
    email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
    password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin')
    phone_number = os.getenv('DJANGO_SUPERUSER_PHONE_NUMBER', '1234567890')
    User.objects.create_superuser(
        phone_number=phone_number,
        password=password,
        username=username,
        email=email
    )
    print(f'Суперюзер "{username}" (phone: {phone_number}) успішно створено!')
else:
    print('Суперюзер вже існує, пропускаємо створення.')

