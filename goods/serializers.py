from decimal import Decimal

from django.db.models import Count
from rest_framework import serializers
from goods.models import (
    Good,
    Category,
    Brand,
    Group,
    Attribute,
    AttributeValue,
    AttributeGroup, ProductImage,
)
from reviews.serializers import ProductReviewSerializer

class ProductImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductImage
        fields = ["id", "image", "description", "uploaded_at"]

class AttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attribute
        fields = ["id", "name", "slug", "order"]


class AttributeGroupSerializer(serializers.ModelSerializer):
    attributes = AttributeSerializer(many=True, read_only=True)

    class Meta:
        model = AttributeGroup
        fields = ["id", "name", "slug", "order", "attributes"]


class AttributeValueSerializer(serializers.ModelSerializer):
    attribute = AttributeSerializer()
    group = serializers.SerializerMethodField()

    class Meta:
        model = AttributeValue
        fields = ["id", "attribute", "value", "group"]

    def get_group(self, obj):
        if obj.attribute.group:
            return {
                "id": obj.attribute.group.id,
                "name": obj.attribute.group.name,
                "slug": obj.attribute.group.slug,
            }
        return None


class GoodSerializer(serializers.ModelSerializer):
    attribute_values = AttributeValueSerializer(many=True, read_only=True)
    group = serializers.CharField(source="category.group.name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_id = serializers.IntegerField(source="category.id", read_only=True)
    brand_name = serializers.CharField(source="brand.name", read_only=True)
    final_rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()  # Change to SerializerMethodField
    groups = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True)
    def get_final_rating(self, obj):
        # Calculate average rating for the product
        reviews = obj.reviews.all()
        if reviews.exists():
            average_rating = sum(review.rating for review in reviews) / reviews.count()
            return round(
                average_rating, 2
            )  # Return the average rating rounded to two decimal places
        return 0  # Return 0 if there are no reviews

    def get_groups(self, obj):
        attribute_groups = AttributeGroup.objects.filter(
            attributes__attribute_values__good=obj
        ).distinct()
        return AttributeGroupSerializer(attribute_groups, many=True).data

    def get_reviews_count(self, obj):
        return obj.reviews.count()

    def get_reviews(self, obj):
        # Get reviews related to the good and serialize them
        reviews = obj.reviews.all()  # Assuming you have a related name 'reviews'
        return ProductReviewSerializer(reviews, many=True).data  # Serialize the reviews

    class Meta:
        model = Good
        read_only_fields = ["slug"]
        fields = "__all__"


class GoodForOrderItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = Good
        read_only_fields = ["slug"]
        fields = ["id", "name", "slug", "final_price"]


class CategorySerializer(serializers.ModelSerializer):
    attributes = AttributeSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = "__all__"


class CategoryForGroupSerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = ["id", "name", "icon_svg"]


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = "__all__"


class GroupSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()

    def get_categories(self, obj):
        # Filter categories that have at least one product
        categories_with_goods = obj.categories.annotate(
            goods_count=Count("goods")
        ).filter(goods_count__gt=0)
        return CategoryForGroupSerializer(categories_with_goods, many=True).data

    class Meta:
        model = Group
        fields = "__all__"


