# admin.py
from django.contrib import admin
from goods.models import (
    Good,
    Category,
    Brand,
    Group,
    Attribute,
    AttributeValue,
    AttributeGroup,
    ProductImage,
)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ["image", "description"]




class AttributeInline(admin.TabularInline):
    model = Attribute
    extra = 1
    fields = ["name", "order", "categories"]


@admin.register(AttributeGroup)
class AttributeGroupAdmin(admin.ModelAdmin):
    list_display = ["name", "order"]
    list_editable = ["order"]
    search_fields = ["name"]
    inlines = [AttributeInline]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Attribute)
class AttributeAdmin(admin.ModelAdmin):
    list_display = ["name", "group", "order"]
    list_editable = ["group", "order"]
    list_filter = ["group", "categories"]
    search_fields = ["name", "group__name"]
    prepopulated_fields = {"slug": ("name",)}
    ordering = ["group__order", "order", "name"]


class AttributeValueInline(admin.TabularInline):
    model = AttributeValue
    extra = 1
    autocomplete_fields = ["attribute"]

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if hasattr(request, "_obj_") and request._obj_ is not None:
            return qs.filter(attribute__categories=request._obj_.category)
        return qs.none()

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "attribute" and hasattr(request, "_obj_"):
            kwargs["queryset"] = (
                Attribute.objects.filter(categories=request._obj_.category)
                .select_related("group")
                .order_by("group__order", "order", "name")
            )
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(Good)
class GoodAdmin(admin.ModelAdmin):
    search_fields = [
        "id",
        "name",
        "slug",
        "category__name",
    ]
    list_display = ["id", "name", "slug", "category", "brand", "price", "sale_percent"]
    readonly_fields = ["final_price"]
    inlines = [AttributeValueInline, ProductImageInline]
    list_filter = ["category"]
    autocomplete_fields = ["category", "brand"]

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if obj is not None:
            request._obj_ = obj
        return form


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    search_fields = ["name"]


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    search_fields = ["name"]


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    search_fields = ["name"]

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    readonly_fields = ['good']