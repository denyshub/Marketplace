from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from users.models import CustomUser
from users.serializers import (
    UserSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def create_auth(request):
    print("Request data:", request.data)
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    print("Validation errors:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        """Return the current user's profile."""
        user = self.request.user
        return CustomUser.objects.filter(id=user.id)

    def retrieve(self, request, *args, **kwargs):
        """Get the current user's profile."""
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        """Update the current user's profile."""
        user = request.user

        # Ensure the user is updating their own profile
        if user.id != request.user.id:
            raise PermissionDenied("You are not authorized to edit this profile.")

        serializer = UserProfileUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
