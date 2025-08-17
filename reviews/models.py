from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

from goods.models import Good
from users.models import CustomUser


class ProductReview(models.Model):
    user = models.ForeignKey(
        CustomUser, related_name="reviews", on_delete=models.CASCADE
    )
    text = models.TextField()
    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    product = models.ForeignKey(Good, related_name="reviews", on_delete=models.CASCADE)
