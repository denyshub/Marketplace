from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

from goods.models import Good
from .models import Cart, CartItem, Order
from .serializers import CartSerializer, OrderSerializer


class CartViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CartSerializer

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def get_user_cart(self):
        """
        Retrieve or create the cart for the authenticated user.
        """
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

    @action(detail=False, methods=["POST"])
    def add_to_cart(self, request):
        cart = self.get_user_cart()

        product_id = request.data.get("product_id")
        quantity = request.data.get("quantity", 1)

        try:
            product = Good.objects.get(id=product_id)
        except Good.DoesNotExist:
            return Response(
                {"detail": "Product not found"}, status=status.HTTP_404_NOT_FOUND
            )

        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        total_quantity = cart_item.quantity + quantity if not created else quantity
        if product.quantity < total_quantity:
            return Response(
                {"detail": "Not enough products in stock"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_item.quantity = total_quantity
        cart_item.save()

        return Response({"detail": "Product added to cart"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["DELETE"])
    def remove_from_cart(self, request):
        cart = self.get_user_cart()

        cart_item_id = request.data.get("cart_item_id")

        try:
            cart_item = CartItem.objects.get(id=cart_item_id, cart=cart)
            cart_item.delete()
            return Response(
                {"detail": "Item removed from cart"}, status=status.HTTP_204_NO_CONTENT
            )
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["PUT"])
    def update_cart_item(self, request):
        cart = self.get_user_cart()

        cart_item_id = request.data.get("cart_item_id")
        quantity = request.data.get("quantity")

        try:
            cart_item = CartItem.objects.get(id=cart_item_id, cart=cart)

            if quantity is not None:
                quantity = int(quantity)
                product = cart_item.product
                if product.quantity < quantity:
                    return Response(
                        {"detail": "Not enough products in stock"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if quantity <= 0:
                    cart_item.delete()
                    return Response(
                        {"detail": "Item removed from cart"},
                        status=status.HTTP_204_NO_CONTENT,
                    )
                else:
                    cart_item.quantity = quantity
                    cart_item.save()
                    return Response(
                        {"detail": "Cart item updated"}, status=status.HTTP_200_OK
                    )
            else:
                return Response(
                    {"detail": "Quantity must be provided"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND
            )


class OrderViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = Order.objects.filter(user=self.request.user).order_by('-created_at')
        return queryset

    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
