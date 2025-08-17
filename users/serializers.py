from rest_framework import serializers
from django.contrib.auth import get_user_model

from cart.serializers import OrderSerializer

UserModel = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_phone_number(self, value):
        if UserModel.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError(
                "Цей номер телефону вже використовується."
            )
        return value

    def validate_email(self, value):
        if UserModel.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Ця електронна пошта вже використовується."
            )
        return value

    def create(self, validated_data):
        if validated_data["password"] != validated_data.pop("confirm_password"):
            raise serializers.ValidationError({"password": "Паролі не збігаються."})

        user = UserModel.objects.create_user(
            username=validated_data["username"],
            phone_number=validated_data["phone_number"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user

    class Meta:
        model = UserModel
        fields = (
            "id",
            "username",
            "phone_number",
            "email",
            "password",
            "confirm_password",
        )


class UserProfileSerializer(serializers.ModelSerializer):
    orders = OrderSerializer(many=True)

    class Meta:
        model = UserModel
        fields = ("id", "username", "phone_number", "email", "orders")


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = (
            "username",
            "phone_number",
            "email",
        )
