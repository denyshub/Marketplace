from decimal import Decimal
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.db import transaction

from goods.models import Good
from goods.serializers import GoodSerializer, GoodForOrderItemSerializer
from .models import CartItem, Cart, Order, OrderItem

from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_order_confirmation_email(order):
    subject = "Підтвердження замовлення"
    html_message = render_to_string("template.html", {"order": order})
    plain_message = strip_tags(html_message)
    from_email = "your_email@gmail.com"
    to_email = (
        order.user.email
    )

    send_mail(subject, plain_message, from_email, [to_email], html_message=html_message)


class CartItemSerializer(serializers.ModelSerializer):
    product = GoodSerializer()
    product_id = serializers.IntegerField(source="product.id")

    class Meta:
        model = CartItem
        fields = ["id", "product", "quantity", "product_id"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True)

    class Meta:
        model = Cart
        fields = ["id", "user", "items"]


class OrderItemsSerializer(serializers.ModelSerializer):
    product = GoodForOrderItemSerializer()  # Use 'product' instead of 'good'

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "quantity",
        ]  # Include the product and quantity fields


class OrderSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    order_items = OrderItemsSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "created_at",
            "updated_at",
            "total_price",
            "phone_number",
            "email",
            "status",
            "order_items",
        ]
        read_only_fields = ["user", "created_at", "updated_at", "total_price"]

    def create(self, validated_data):
        request = self.context.get("request")
        user = validated_data["user"]
        cart_instance, created = Cart.objects.get_or_create(user=user)

        customer_phone_number = request.data.get("phone")
        customer_email = request.data.get("email")

        total_price = Decimal("0.00")

        # Verify if there are items in the cart
        if not cart_instance.items.exists():
            raise ValidationError("The cart is empty.")

        order_items_data = []

        with transaction.atomic():
            for item in cart_instance.items.select_for_update():
                product = Good.objects.select_for_update().get(id=item.product_id)

                # Check if there is enough quantity of the product
                if item.quantity <= product.quantity:
                    total_price += Decimal(product.final_price) * Decimal(item.quantity)
                    product.quantity -= item.quantity
                    product.save()

                    # Store the item data for later OrderItem creation
                    order_items_data.append(
                        {"product": product, "quantity": item.quantity}
                    )
                else:
                    raise ValidationError(f"Not enough product ID: {item.product_id}")

            # Create the order with the phone number and email
            order = Order.objects.create(
                total_price=total_price,
                user=user,
                phone_number=customer_phone_number,
                email=customer_email,
            )

            # Create OrderItems in bulk
            for item_data in order_items_data:
                OrderItem.objects.create(
                    order=order,
                    product=item_data["product"],
                    quantity=item_data["quantity"],
                )

            # Clear the cart after creating the order
            # send_order_confirmation_email(order)
            cart_instance.items.all().delete()

        return order
