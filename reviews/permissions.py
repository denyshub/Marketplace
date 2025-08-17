from rest_framework.permissions import BasePermission, SAFE_METHODS


class ReviewAdminAuthorOrReadOnly(BasePermission):

    def has_permission(self, request, view):

        if request.method in SAFE_METHODS:
            return True

        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):

        if request.method in SAFE_METHODS:
            return True

        if request.method in ["PUT", "PATCH"]:
            return obj.user == request.user

        if request.method == "DELETE":
            return request.user.is_authenticated and (
                obj.user == request.user or request.user.is_staff
            )
        if request.method == "POST":
            return request.user.is_authenticated
        return False
