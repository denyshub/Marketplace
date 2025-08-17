from rest_framework import serializers

from reviews.models import ProductReview


class ProductReviewSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    author = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = ProductReview

        fields = ["id", "text", "product", "rating", "user", "author", "created_at"]
