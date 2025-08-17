import django_filters
from django.db.models import Q, Count
from rest_framework import viewsets
from django_filters import rest_framework as filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from goods.models import Good, Category, Brand, Group, Attribute, AttributeValue, ProductImage
from goods.permissions import IsAdminOrReadOnly
from goods.serializers import (
    CategorySerializer,
    GoodSerializer,
    BrandSerializer,
    AttributeSerializer,
    AttributeValueSerializer,
    GroupSerializer,
    ProductImageSerializer,
)
from reviews.serializers import ProductReviewSerializer


class AttributeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AttributeSerializer

    def get_queryset(self):
        category_ids = self.request.query_params.getlist("category")
        queryset = Attribute.objects.filter(is_filter=True)

        if category_ids:
            queryset = queryset.filter(categories__id__in=category_ids).distinct()

        return queryset


class AttributeValueViewSet(viewsets.ModelViewSet):
    queryset = AttributeValue.objects.all()
    serializer_class = AttributeValueSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get("category")

        if category:
            queryset = queryset.filter(
                good__category__name__iexact=category
            ).annotate(product_count=Count("good")).filter(product_count__gt=0)

        queryset = queryset.filter(attribute__is_filter=True)
        return queryset


class GoodFilter(filters.FilterSet):
    category = filters.CharFilter(field_name="category__name", lookup_expr="iexact")
    brand = filters.CharFilter(method="filter_by_brands")
    group = filters.CharFilter(field_name="category__group__name", lookup_expr="iexact")
    min_price = filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = filters.NumberFilter(field_name="price", lookup_expr="lte")
    search = filters.CharFilter(method="filter_by_search")

    def filter_by_brands(self, queryset, name, value):
        if value:
            brand_names = value.split(",")
            return queryset.filter(brand__name__in=[brand.strip() for brand in brand_names]).distinct()
        return queryset

    def filter_by_search(self, queryset, name, value):
        if value:
            return queryset.filter(
                Q(name__icontains=value)
                | Q(brand__name__icontains=value)
                | Q(category__name__icontains=value)
                | Q(attribute_values__value__icontains=value)
            ).distinct()
        return queryset

    def filter_by_attribute(self, queryset, name, value, attribute_name=None):
        if value:
            filter_kwargs = {
                "attribute_values__attribute__name": attribute_name or name,
                "attribute_values__value__in": value,
            }
            return queryset.filter(**filter_kwargs).distinct()
        return queryset

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        attributes = Attribute.objects.all()

        for attr in attributes:
            filter_name = attr.name.lower().replace(" ", "_")
            self.filters[filter_name] = filters.BaseInFilter(
                method=lambda queryset, name, value, attr_name=attr.name: self.filter_by_attribute(
                    queryset, name, value, attr_name
                )
            )

    class Meta:
        model = Good
        fields = ["category", "brand", "group", "min_price", "max_price"]


class CustomPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = "limit"
    max_page_size = 100


class GoodViewSet(viewsets.ModelViewSet):
    serializer_class = GoodSerializer
    lookup_field = "slug"
    queryset = Good.objects.select_related("category", "brand").prefetch_related("attribute_values").all()
    filter_backends = [DjangoFilterBackend]
    filterset_class = GoodFilter
    pagination_class = CustomPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        sale_filter = self.request.query_params.get("sale_percent")
        sorting = self.request.query_params.get("sort")

        if sale_filter and sale_filter.lower() == "true":
            queryset = queryset.filter(Q(sale_percent__gt=0) & Q(quantity__gt=0))

        if sorting:
            sorting_options = {
                "price_asc": "final_price",
                "price_desc": "-final_price",
                "popularity": "-reviews_count"
            }
            queryset = queryset.annotate(reviews_count=Count("reviews")).order_by(sorting_options.get(sorting, "final_price"))

        attribute_ids = self.request.query_params.getlist("attributes")
        if attribute_ids:
            queryset = queryset.filter(attributes__id__in=attribute_ids).distinct()

        return queryset.distinct()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset()).filter(quantity__gt=0)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="all")
    def all(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.annotate(goods_count=Count("goods")).filter(goods_count__gt=0)
    serializer_class = CategorySerializer


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(goods__category__name__iexact=category).annotate(
                product_count=Count("goods")
            ).filter(product_count__gt=0)
        return queryset


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.prefetch_related("categories").annotate(
        categories_with_goods=Count("categories__goods")
    ).filter(categories_with_goods__gt=0)
    serializer_class = GroupSerializer


class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
