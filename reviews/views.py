from django.shortcuts import render
from rest_framework import viewsets

from reviews.models import ProductReview
from reviews.permissions import ReviewAdminAuthorOrReadOnly
from reviews.serializers import ProductReviewSerializer


class ProductReviewViewSet(viewsets.ModelViewSet):
    queryset = ProductReview.objects.all()
    serializer_class = ProductReviewSerializer
    permission_classes = [ReviewAdminAuthorOrReadOnly]
