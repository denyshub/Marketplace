from decimal import Decimal, ROUND_HALF_UP

from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils.text import slugify
import inflect

inflector = inflect.engine()


class Group(models.Model):
    name = models.CharField(
        max_length=255, verbose_name="Group Name", default="Unknown Group"
    )
    slug = models.SlugField(
        max_length=255, verbose_name="Slug", default="unknown-group", blank=True
    )

    def save(self, *args, **kwargs):
        self.name = self.name.capitalize()
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Group"
        verbose_name_plural = "Groups"


class Category(models.Model):
    name = models.CharField(
        max_length=255, verbose_name="Category Name", default="Unknown Category"
    )
    slug = models.SlugField(
        max_length=255, blank=True, verbose_name="Slug", default="unknown-category"
    )
    group = models.ForeignKey(
        Group,
        related_name="categories",
        on_delete=models.SET_DEFAULT,
        default=1,
        verbose_name="Group",
    )
    icon_svg = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        self.name = self.name.capitalize()
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"


class Brand(models.Model):
    name = models.CharField(
        max_length=255, verbose_name="Brand Name", default="Unknown Brand"
    )
    slug = models.SlugField(
        max_length=255, blank=True, verbose_name="Slug", default="unknown-brand"
    )

    def save(self, *args, **kwargs):
        self.name = self.name.capitalize()
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):

        return self.name

    class Meta:
        verbose_name = "Brand"
        verbose_name_plural = "Brands"


class Good(models.Model):
    name = models.CharField(
        max_length=255, verbose_name="Good Name", default="Unknown Product"
    )
    slug = models.SlugField(
        max_length=255,
        verbose_name="Slug",
        unique=True,
        default="unknown-product",
        null=True,
        blank=True,
    )
    category = models.ForeignKey(
        Category,
        related_name="goods",
        on_delete=models.SET_DEFAULT,
        default=1,
        verbose_name="Category",
    )
    brand = models.ForeignKey(
        Brand,
        related_name="goods",
        on_delete=models.SET_DEFAULT,
        default=1,
        verbose_name="Brand",
    )
    price = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Price", default=0
    )
    sale_percent = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Sale Percentage",
        null=True,
    )
    description = models.TextField(null=True, blank=True, verbose_name="Description")
    image = models.ImageField(
        upload_to="goods/", null=True, blank=True, verbose_name="Image"
    )
    quantity = models.PositiveIntegerField(null=True)
    final_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Final Price",
        null=True,
        blank=True,
    )

    def calculate_final_price(self):
        if self.sale_percent:
            discount = Decimal(self.sale_percent) / Decimal(100) * self.price
            # Calculate final price and round to the nearest whole number
            self.final_price = (self.price - discount).quantize(
                Decimal("1"), rounding=ROUND_HALF_UP
            )
        else:
            self.final_price = self.price.quantize(Decimal("1"), rounding=ROUND_HALF_UP)

    def save(self, *args, **kwargs):
        singular_category_name = (
            inflector.singular_noun(self.category.name) or self.category.name
        )
        category_name_title = singular_category_name.title()
        if not self.name.lower().startswith(category_name_title.lower()):
            self.name = f"{category_name_title} {self.name}"

        # Call the method to calculate final price
        self.calculate_final_price()

        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name}, {self.category}, {self.brand}"

    class Meta:
        verbose_name = "Good"
        verbose_name_plural = "Goods"


class AttributeGroup(models.Model):
    name = models.CharField(max_length=255, verbose_name="Group Name")
    slug = models.SlugField(max_length=255, null=True, blank=True)
    categories = models.ManyToManyField(
        Category, related_name="attribute_groups", verbose_name="Categories"
    )
    order = models.PositiveIntegerField(default=0, verbose_name="Display Order")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Attribute Group"
        verbose_name_plural = "Attribute Groups"
        ordering = ["order", "name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Attribute(models.Model):
    name = models.CharField(max_length=255, verbose_name="Attribute Name")
    slug = models.SlugField(max_length=255, null=True, blank=True)
    is_filter = models.BooleanField(default=True)
    group = models.ForeignKey(
        AttributeGroup,
        related_name="attributes",
        on_delete=models.CASCADE,
        verbose_name="Attribute Group",
        null=True,
        blank=True,
    )
    categories = models.ManyToManyField(
        Category, related_name="attributes", verbose_name="Categories"
    )
    order = models.PositiveIntegerField(default=0, verbose_name="Display Order")

    def __str__(self):
        if self.group:
            return f"{self.group.name} - {self.name}"
        return self.name

    class Meta:
        verbose_name = "Attribute"
        verbose_name_plural = "Attributes"
        ordering = ["group__order", "order", "name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class AttributeValue(models.Model):
    good = models.ForeignKey(
        Good,
        related_name="attribute_values",
        on_delete=models.CASCADE,
        verbose_name="Good",
    )
    attribute = models.ForeignKey(
        Attribute,
        related_name="attribute_values",
        on_delete=models.CASCADE,
        verbose_name="Attribute",
    )
    value = models.CharField(max_length=255, verbose_name="Value")

    def __str__(self):
        return f"{self.attribute.name}: {self.value} ({self.good.name})"

    class Meta:
        verbose_name = "Attribute Value"
        verbose_name_plural = "Attribute Values"
        unique_together = ("good", "attribute")
        ordering = ["attribute__group__order", "attribute__order"]


class ProductImage(models.Model):
    good = models.ForeignKey(Good, related_name="images", null=True, on_delete=models.CASCADE)
    image = models.ImageField(
        upload_to="goods/", null=True, blank=True, verbose_name="Image"
    )
    description = models.TextField(max_length=100, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.good.name}"