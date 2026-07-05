from rest_framework import serializers
from .models import Profile
from users.models import ContentCategory
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
import re
from datetime import date
User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"}
    )
    firstName = serializers.CharField(write_only=True)
    lastName = serializers.CharField(write_only=True)
    phoneNumber = serializers.CharField(write_only=True)
    dateOfBirth = serializers.DateField(write_only=True)

    interests = serializers.PrimaryKeyRelatedField(
        queryset=ContentCategory.objects.all(),
        many=True,
        required=False
    )

    class Meta:
        model = Profile
        fields = [
            "email",
            "password",
            "firstName",
            "lastName",
            "phoneNumber",
            "dateOfBirth",
            "interests",
        ]

    def validate_email(self, value):
        value = value.strip().lower()

        if Profile.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "Email is already in use."
            )

        return value

    def validate_firstName(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "First name must be at least 2 characters."
            )

        if len(value) > 30:
            raise serializers.ValidationError(
                "First name cannot exceed 30 characters."
            )

        if not re.fullmatch(r"[A-Za-z]+", value):
            raise serializers.ValidationError(
                "Only letters are allowed."
            )

        return value

    def validate_lastName(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "Last name must be at least 2 characters."
            )

        if len(value) > 30:
            raise serializers.ValidationError(
                "Last name cannot exceed 30 characters."
            )

        if not re.fullmatch(r"[A-Za-z]+", value):
            raise serializers.ValidationError(
                "Only letters are allowed."
            )

        return value

    def validate_phoneNumber(self, value):
        value = value.strip()

        if not re.fullmatch(r"^[6-9]\d{9}$", value):
            raise serializers.ValidationError(
                "Enter a valid 10-digit mobile number."
            )

        return value

    def validate_password(self, value):

        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters."
            )
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError(
                "Password must contain at least one uppercase letter."
            )
        if not re.search(r"[a-z]", value):
            raise serializers.ValidationError(
                "Password must contain at least one lowercase letter."
            )
        if not re.search(r"\d", value):
            raise serializers.ValidationError(
                "Password must contain at least one number."
            )

        return value

    def validate_dateOfBirth(self, value):

        today = date.today()
        age = (today.year - value.year - ( (today.month, today.day) < (value.month, value.day)))

        if age < 18:
            raise serializers.ValidationError("You must be at least 18 years old.")
        return value
    
    def create(self, validated_data):
        first_name = validated_data.pop("firstName")
        last_name = validated_data.pop("lastName")
        phone = validated_data.pop("phoneNumber")
        dob = validated_data.pop("dateOfBirth")
        interests = validated_data.pop("interests", [])

        user = Profile(
            email=validated_data["email"],
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            dateOfBirth=dob,
        )

        user.set_password(validated_data["password"])
        user.save()
        if interests:
            user.interests.set(interests)
        return user
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Must include email and password.")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials.")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials.")

        attrs["username"] = user.username
        return super().validate(attrs)
    
class ContentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentCategory
        fields = ['id', 'name']
    
class UserProfieSerialzier(serializers.ModelSerializer):
    interests = ContentCategorySerializer(many=True, read_only=True)
    class Meta:
        model = Profile
        fields = ['id', 'email', 'bio', 'profile_picture', 'interests', 'first_name', 'dateOfBirth']
        read_only_fields = ['id', 'email']