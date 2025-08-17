from django.contrib import admin
from cart.models import CartItem, Cart, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = ["product", "quantity"]
    readonly_fields = ["product", "quantity"]


class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "created_at", "user", "total_price"]
    list_filter = ["created_at"]
    search_fields = ["user__username", "id"]
    readonly_fields = ["total_price", "phone_number", "email", "user"]
    inlines = [OrderItemInline]

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.prefetch_related("order_items")


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    fields = ["product", "quantity"]
    readonly_fields = ["product", "quantity"]


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    readonly_fields = ["user"]
    inlines = [CartItemInline]  # Inline CartItem list within Cart admin


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    readonly_fields = ["cart", "quantity", "product"]


# Register the Order model with its custom admin configuration
admin.site.register(Order, OrderAdmin)
