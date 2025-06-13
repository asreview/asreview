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

import json
import logging
from pathlib import Path

from flask import Blueprint
from flask import jsonify
from flask import request
from sqlalchemy import select
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.exc import SQLAlchemyError

from asreview.webapp import DB
from asreview.webapp._authentication.decorators import admin_required
from asreview.webapp._authentication.models import Project
from asreview.webapp._authentication.models import User
from asreview.webapp.utils import asreview_path

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


@bp.route("/projects", methods=["GET"])
@admin_required
def get_all_projects():
    """Get all projects across all users (admin only)"""
    try:
        stmt = select(Project)
        projects = DB.session.execute(stmt).scalars().all()
        project_list = []

        for db_project in projects:
            try:
                # Build the path to the project.json file
                project_path = (
                    Path(asreview_path()) / db_project.project_id / "project.json"
                )

                # Initialize project data with database info
                project_data = {
                    "id": db_project.id,
                    "project_id": db_project.project_id,
                    "owner_id": db_project.owner_id,
                    "owner_name": (db_project.owner.name or db_project.owner.identifier)
                    if db_project.owner
                    else "Unknown",
                    "owner_email": db_project.owner.email
                    if db_project.owner
                    else "Unknown",
                    "name": "Unknown",  # Default value
                    "created_at_unix": None,
                    "version": None,
                    "mode": None,
                    "status": "error",  # Default to error, will be updated if config is valid
                }

                # Try to read project.json file for additional details
                if project_path.exists():
                    try:
                        with open(project_path, "r", encoding="utf-8") as f:
                            project_config = json.load(f)

                        # Update with data from project.json
                        project_data.update(
                            {
                                "name": project_config.get("name", "Unnamed Project"),
                                "created_at_unix": project_config.get(
                                    "created_at_unix"
                                ),
                                "version": project_config.get("version"),
                                "mode": project_config.get("mode"),
                            }
                        )

                        # Determine status from project.json
                        reviews = project_config.get("reviews", [])
                        if reviews:
                            # Use the status from the first review
                            project_data["status"] = reviews[0].get("status", "setup")
                        else:
                            # No reviews in config, set to setup status
                            project_data["status"] = "setup"

                    except (json.JSONDecodeError, IOError) as e:
                        logging.warning(
                            f"Could not read project.json for {db_project.project_id}: {e}"
                        )
                        # Keep error status (already set), add error details
                        project_data["error"] = "Could not read project configuration"
                else:
                    # Keep error status (already set), add error details
                    project_data["error"] = "Project configuration file not found"

                project_list.append(project_data)

            except Exception as e:
                logging.error(f"Error processing project {db_project.project_id}: {e}")
                # Still add the project but mark it as having an error
                project_list.append(
                    {
                        "id": db_project.id,
                        "project_id": db_project.project_id,
                        "owner_id": db_project.owner_id,
                        "owner_name": (
                            db_project.owner.name or db_project.owner.identifier
                        )
                        if db_project.owner
                        else "Unknown",
                        "owner_email": db_project.owner.email
                        if db_project.owner
                        else "Unknown",
                        "name": "Error Loading Project",
                        "status": "error",
                        "error": str(e),
                    }
                )

        # Sort projects by creation date (newest first), with None values last
        project_list = sorted(
            project_list,
            key=lambda x: (
                x.get("created_at_unix") is not None,
                x.get("created_at_unix") or 0,
            ),
            reverse=True,
        )

        return jsonify(
            {"projects": project_list, "total_count": len(project_list)}
        ), 200

    except SQLAlchemyError as e:
        return jsonify({"message": f"Database error: {str(e)}"}), 500
    except Exception as e:
        logging.error(f"Error retrieving projects: {e}")
        return jsonify({"message": f"Error retrieving projects: {str(e)}"}), 500


@bp.route("/projects/<int:project_id>/transfer-ownership", methods=["POST"])
@admin_required
def transfer_project_ownership(project_id):
    """Transfer project ownership to another user (admin only)"""
    try:
        data = request.get_json()
        new_owner_id = data.get("new_owner_id")

        if not new_owner_id:
            return jsonify({"message": "new_owner_id is required"}), 400

        # Get the project
        project = DB.session.get(Project, project_id)
        if not project:
            return jsonify({"message": "Project not found"}), 404

        # Get the new owner
        new_owner = DB.session.get(User, new_owner_id)
        if not new_owner:
            return jsonify({"message": "New owner not found"}), 404

        # Check if the new owner is different from current owner
        if project.owner_id == new_owner_id:
            return jsonify(
                {"message": "User is already the owner of this project"}
            ), 400

        # Store old owner reference for cleanup
        old_owner = project.owner

        # Remove new owner from collaborators if they're currently a member
        if new_owner in project.collaborators:
            project.collaborators.remove(new_owner)

        # Remove new owner from pending invitations if they have one
        if new_owner in project.pending_invitations:
            project.pending_invitations.remove(new_owner)

        # Transfer ownership
        project.owner_id = new_owner_id

        # Remove old owner from collaborators list (complete removal)
        if old_owner and old_owner in project.collaborators:
            project.collaborators.remove(old_owner)

        # Remove old owner from pending invitations if they had one
        if old_owner and old_owner in project.pending_invitations:
            project.pending_invitations.remove(old_owner)
        DB.session.commit()

        return jsonify(
            {
                "message": "Project ownership transferred successfully",
                "project": {
                    "id": project.id,
                    "project_id": project.project_id,
                    "new_owner": {
                        "id": new_owner.id,
                        "name": new_owner.name,
                        "email": new_owner.email,
                    },
                },
            }
        ), 200

    except ValueError as e:
        DB.session.rollback()
        return jsonify({"message": f"Validation error: {str(e)}"}), 400
    except SQLAlchemyError as e:
        DB.session.rollback()
        return jsonify({"message": f"Database error: {str(e)}"}), 500
    except Exception as e:
        DB.session.rollback()
        logging.error(f"Error transferring project ownership: {e}")
        return jsonify(
            {"message": f"Error transferring project ownership: {str(e)}"}
        ), 500


@bp.route("/projects/<int:project_id>/add-member", methods=["POST"])
@admin_required
def add_project_member(project_id):
    """Add a member to a project directly (admin only)"""
    try:
        # Get the user ID from request JSON
        data = request.get_json()
        if not data or "user_id" not in data:
            return jsonify({"message": "User ID is required"}), 400

        user_id = data["user_id"]

        # Get project
        project = DB.session.get(Project, project_id)
        if not project:
            return jsonify({"message": "Project not found"}), 404

        # Get user
        user = DB.session.get(User, user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        # Check if user is already the owner
        if user.id == project.owner_id:
            return jsonify({"message": "Cannot add project owner as member"}), 400

        # Check if user is already a collaborator
        if user in project.collaborators:
            return jsonify({"message": "User is already a member"}), 400

        # Check if user has a pending invitation
        if user in project.pending_invitations:
            return jsonify({"message": "User already has a pending invitation"}), 400

        # Add user as collaborator
        project.collaborators.append(user)
        DB.session.commit()

        # Import here to avoid circular imports
        from asreview.webapp._api.team import get_user_project_properties
        from flask_login import current_user

        user_props = get_user_project_properties(user, project, current_user)

        return jsonify(
            {"message": "Member added successfully", "user": user_props}
        ), 200

    except SQLAlchemyError as e:
        DB.session.rollback()
        logging.exception(e)
        return jsonify({"message": f"Database error: {str(e)}"}), 500
    except Exception as e:
        DB.session.rollback()
        logging.exception(e)
        return jsonify({"message": f"Error adding member: {str(e)}"}), 500
