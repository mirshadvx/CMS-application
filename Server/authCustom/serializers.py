from rest_framework import serializers
from .models import Profile
from users.models import ContentCategory

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    firstName = serializers.CharField(write_only=True)
    lastName = serializers.CharField(write_only=True)
    phoneNumber = serializers.CharField(write_only=True)
    dateOfBirth = serializers.DateField(write_only=True)
    interests = serializers.PrimaryKeyRelatedField(queryset=ContentCategory.objects.all(), many=True, required=False)

    class Meta:
        model = Profile
        fields = [
            'email', 'password',
            'firstName', 'lastName', 'phoneNumber', 'dateOfBirth',
            'interests'
        ]

    def validate_email(self, value):
        if Profile.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already in use.")
        return value

    def create(self, validated_data):
        first_name = validated_data.pop('firstName')
        last_name = validated_data.pop('lastName')
        phone = validated_data.pop('phoneNumber')
        dob = validated_data.pop('dateOfBirth')
        interests = validated_data.pop('interests', [])

        user = Profile(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            dateOfBirth=dob
        )
        user.set_password(validated_data['password'])
        user.save()
        user.interests.set(interests)
        return user
