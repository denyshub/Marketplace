import debug_toolbar
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from cart.views import CartViewSet, OrderViewSet
from goods.views import (
    GoodViewSet,
    CategoryViewSet,
    BrandViewSet,
    GroupViewSet,
    AttributeViewSet,
    AttributeValueViewSet,
    ProductImageViewSet,
)
from reviews.views import ProductReviewViewSet
from users.views import create_auth, UserProfileViewSet

router = routers.DefaultRouter()
router.register(r"good", GoodViewSet, basename="goods")
router.register(r"category", CategoryViewSet, basename="category")
router.register(r"brand", BrandViewSet, basename="brand")
router.register(r"group", GroupViewSet, basename="group")
router.register(r"attribute", AttributeViewSet, basename="attribute")
router.register(r"attribute-values", AttributeValueViewSet)
router.register(r"cart", CartViewSet, basename="cart")
router.register(r"reviews", ProductReviewViewSet, basename="reviews")
router.register(r"orders", OrderViewSet, basename="orders")
router.register(r"profile", UserProfileViewSet, basename="profile")
router.register(r"product_image", ProductImageViewSet, basename="product_image")

urlpatterns = [
    re_path(r'^__debug__/', include(debug_toolbar.urls)),
    path("admin/", admin.site.urls),
    path("api/v1/", include(router.urls)),  # Routes API calls to registered ViewSets
    path("api/v1/users/register/", create_auth, name="register"),
    path("api/v1/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/v1/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
