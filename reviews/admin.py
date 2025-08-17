# from django.contrib import admin
# from .models import ProductReview
#
# @admin.register(ProductReview)
# class ProductReviewAdmin(admin.ModelAdmin):
#     list_display = [
#         "product",
#         "user",
#         "rating",
#         "created_at",
#     ]
#     search_fields = ["product__name", "user__username"]
#     list_filter = ["rating", "created_at"]
#
#     def get_queryset(self, request):
#         # Allow superusers to see all reviews; others can only see their own
#         qs = super().get_queryset(request)
#         if request.user.is_superuser:
#             return qs
#         return qs.filter(user=request.user)
#
#     def save_model(self, request, obj, form, change):
#         # Assign the current user as the reviewer when creating a new review
#         if not change:  # If the object is new
#             obj.user = request.user
#         super().save_model(request, obj, form, change)
#
#     def has_change_permission(self, request, obj=None):
#         # Allow change permission only if the user is the author or a superuser
#         if obj is not None and obj.user != request.user and not request.user.is_superuser:
#             return False
#         return super().has_change_permission(request, obj)
#
#     def has_delete_permission(self, request, obj=None):
#         # Allow delete permission only if the user is the author or a superuser
#         if obj is not None and obj.user != request.user and not request.user.is_superuser:
#             return False
#         return super().has_delete_permission(request, obj)
