# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from flask import Blueprint
from flask import jsonify
from flask import request
from sqlalchemy import select
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.exc import SQLAlchemyError

from asreview.webapp import DB
from asreview.webapp._authentication.decorators import admin_required
from asreview.webapp._authentication.models import User

bp = Blueprint("admin", __name__, url_prefix="/admin")


@bp.route("/users", methods=["GET"])
@admin_required
def get_users():
    """Get all users (admin only)"""
    try:
        stmt = select(User)
        users = DB.session.execute(stmt).scalars().all()
        user_list = []

        for user in users:
            user_data = {
                "id": user.id,
                "identifier": user.identifier,
                "origin": user.origin,
                "email": user.email,
                "name": user.name,
                "affiliation": user.affiliation,
                "confirmed": user.confirmed,
                "public": user.public,
                "role": user.role,
            }
            user_list.append(user_data)

        return jsonify({"users": user_list}), 200
    except SQLAlchemyError as e:
        return jsonify({"message": f"Database error: {str(e)}"}), 500


@bp.route("/users", methods=["POST"])
@admin_required
def create_user():
    """Create a new user (admin only)"""
    try:
        data = request.get_json()

        # Required fields
        name = data.get("name", "").strip()
        email = data.get("email", "").strip() if data.get("email") else None

        # Optional fields
        affiliation = (
            data.get("affiliation", "").strip() if data.get("affiliation") else None
        )
        password = data.get("password")
        confirmed = data.get("confirmed", True)
        public = data.get("public", True)
        role = data.get("role", "member")

        # Check if user already exists
        existing_user = User.query.filter(
            or_(User.identifier == email, User.email == email)
        ).first()

        if existing_user:
            return jsonify(
                {"message": "User with this identifier or email already exists"}
            ), 409

        # Create new user
        user = User(
            identifier=email,
            email=email,
            name=name,
            origin="asreview",
            affiliation=affiliation,
            password=password,
            confirmed=confirmed,
            public=public,
        )
        user.role = role

        DB.session.add(user)
        DB.session.commit()

        return jsonify(
            {
                "message": "User created successfully",
                "user": {
                    "id": user.id,
                    "identifier": user.identifier,
                    "email": user.email,
                    "name": user.name,
                    "role": user.role,
                },
            }
        ), 201

    except ValueError as e:
        DB.session.rollback()
        return jsonify({"message": f"Validation error: {str(e)}"}), 400
    except IntegrityError as e:
        DB.session.rollback()
        return jsonify({"message": f"User already exists: {str(e)}"}), 409
    except SQLAlchemyError as e:
        DB.session.rollback()
        return jsonify({"message": f"Database error: {str(e)}"}), 500


@bp.route("/users/<int:user_id>", methods=["PUT"])
@admin_required
def update_user(user_id):
    """Update a user (admin only)"""
    try:
        user = DB.session.get(User, user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        data = request.get_json()

        # Update fields if provided
        if "email" in data:
            user.email = data["email"].strip() if data["email"] else None
            user.identifier = user.email
        if "name" in data:
            user.name = data["name"].strip()
        if "affiliation" in data:
            user.affiliation = (
                data["affiliation"].strip() if data["affiliation"] else None
            )
        if "confirmed" in data:
            user.confirmed = data["confirmed"]
        if "public" in data:
            user.public = data["public"]
        if "role" in data:
            user.role = data["role"]

        # Handle password update
        if "password" in data and data["password"]:
            if user.origin == "asreview":
                user.hashed_password = User.create_password_hash(data["password"])
            else:
                return jsonify(
                    {"message": "Cannot set password for non-asreview users"}
                ), 400

        DB.session.commit()

        return jsonify(
            {
                "message": "User updated successfully",
                "user": {
                    "id": user.id,
                    "identifier": user.identifier,
                    "email": user.email,
                    "name": user.name,
                    "role": user.role,
                },
            }
        ), 200

    except ValueError as e:
        DB.session.rollback()
        return jsonify({"message": f"Validation error: {str(e)}"}), 400
    except IntegrityError as e:
        DB.session.rollback()
        return jsonify({"message": f"Integrity error: {str(e)}"}), 409
    except SQLAlchemyError as e:
        DB.session.rollback()
        return jsonify({"message": f"Database error: {str(e)}"}), 500


@bp.route("/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    """Delete a user (admin only)"""
    try:
        user = DB.session.get(User, user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        # Store user info for response
        user_info = {
            "id": user.id,
            "identifier": user.identifier,
            "email": user.email,
            "name": user.name,
        }

        DB.session.delete(user)
        DB.session.commit()

        return jsonify(
            {"message": "User deleted successfully", "deleted_user": user_info}
        ), 200

    except SQLAlchemyError as e:
        DB.session.rollback()
        return jsonify({"message": f"Database error: {str(e)}"}), 500


@bp.route("/users/<int:user_id>", methods=["GET"])
@admin_required
def get_user(user_id):
    """Get a specific user by ID (admin only)"""
    try:
        user = DB.session.get(User, user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        user_data = {
            "id": user.id,
            "identifier": user.identifier,
            "origin": user.origin,
            "email": user.email,
            "name": user.name,
            "affiliation": user.affiliation,
            "confirmed": user.confirmed,
            "public": user.public,
            "role": user.role,
        }

        return jsonify({"user": user_data}), 200

    except SQLAlchemyError as e:
        return jsonify({"message": f"Database error: {str(e)}"}), 500
