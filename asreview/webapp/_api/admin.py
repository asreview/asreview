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
from asreview.webapp._task_manager.models import ProjectQueueModel
from asreview.webapp._task_manager.task_manager import (
    DEFAULT_TASK_MANAGER_HOST,
    DEFAULT_TASK_MANAGER_PORT,
)
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from datetime import timezone
import socket

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


# Please note: the Task Manager is running in an independent process. It might
# get stuck. The route below checks the status of the Task Manager in 2 ways.
# It reads the waiting projects directly from the queue database. If the waiting
# time is very long it might point to a problem in the Task Manager.
# It also requests the status of the amount of running processes (model training)
# via the Task Manager. When the Task Manager is stuck we probably won't get a
# response.
@bp.route("/task-queue-status", methods=["GET"])
@admin_required
def get_task_queue_status():
    """Get task queue status (admin only)"""
    try:
        # Create separate connection to queue database
        session, engine = _create_queue_database_session()

        try:
            # Get all waiting tasks ordered by creation time
            waiting_tasks = (
                session.query(ProjectQueueModel)
                .order_by(ProjectQueueModel.created_at)
                .all()
            )

            # Convert all timestamps to UTC timezone-aware immediately
            for task in waiting_tasks:
                task.created_at = _ensure_utc_timezone(task.created_at)

            total_waiting = len(waiting_tasks)
            oldest_waiting_seconds = None
            waiting_projects = []

            # Process waiting tasks (timestamps are now all UTC timezone-aware)
            for task in waiting_tasks:
                # Calculate waiting time in seconds for each task
                waiting_seconds = None
                if task.created_at:
                    time_diff = datetime.now(timezone.utc) - task.created_at
                    waiting_seconds = round(time_diff.total_seconds(), 2)

                waiting_projects.append(
                    {
                        "project_id": task.project_id,
                        "simulation": task.simulation,
                        "waiting_seconds": waiting_seconds,
                    }
                )

            # Calculate oldest waiting time (timestamps already converted)
            if waiting_tasks and waiting_tasks[0].created_at:
                time_diff = datetime.now(timezone.utc) - waiting_tasks[0].created_at
                oldest_waiting_seconds = int(time_diff.total_seconds())

            # Try to get Task Manager status
            task_manager_result = _get_task_manager_status()

            response = {
                "total_waiting": total_waiting,
                "oldest_waiting_seconds": oldest_waiting_seconds,
                "waiting_projects": waiting_projects,
                "task_manager_status": task_manager_result["status"],
                "task_manager_error": task_manager_result.get("error"),
            }

            if task_manager_result["status"] == "connected":
                response["task_manager_info"] = task_manager_result["data"]
                # Include running project IDs for admin monitoring
                response["running_projects"] = task_manager_result["data"].get(
                    "running_project_ids", []
                )

            return jsonify(response), 200

        finally:
            session.close()
            engine.dispose()

    except Exception as e:
        logging.error(f"Error retrieving task queue status: {e}")
        return jsonify(
            {"message": f"Error retrieving task queue status: {str(e)}"}
        ), 500


@bp.route("/task-queue-reset", methods=["POST"])
@admin_required
def reset_task_queue():
    """Reset (clear) the task queue (admin only)"""
    try:
        # Step 1: Clear the database
        session, engine = _create_queue_database_session()

        try:
            # Get count before clearing
            waiting_count = session.query(ProjectQueueModel).count()

            # Clear all waiting tasks
            session.query(ProjectQueueModel).delete()
            session.commit()

            logging.info(f"Cleared {waiting_count} waiting tasks from queue database")

        finally:
            session.close()
            engine.dispose()

        # Step 2: Signal Task Manager to reset pending tasks
        try:
            client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            client_socket.settimeout(3.0)  # Add timeout for consistency
            client_socket.connect(
                (DEFAULT_TASK_MANAGER_HOST, DEFAULT_TASK_MANAGER_PORT)
            )

            payload = {"action": "reset_pending"}
            client_socket.sendall(json.dumps(payload).encode("utf-8"))
            client_socket.close()

            logging.info("Sent reset signal to Task Manager")

        except socket.error as e:
            logging.warning(
                f"Could not signal Task Manager to reset pending tasks: {e}"
            )
            # Continue anyway - database was cleared successfully

        return jsonify(
            {
                "message": "Task queue reset successfully",
                "cleared_waiting_tasks": waiting_count,
            }
        ), 200

    except Exception as e:
        logging.error(f"Error resetting task queue: {e}")
        return jsonify({"message": f"Error resetting task queue: {str(e)}"}), 500


def _ensure_utc_timezone(dt):
    """Convert naive datetime to UTC timezone-aware datetime."""
    if dt and dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def _create_queue_database_session():
    """Create a database session for the queue database."""
    database_url = f"sqlite:///{asreview_path()}/queue.sqlite"
    engine = create_engine(database_url, pool_size=1, max_overflow=0)
    Session = sessionmaker(bind=engine)
    return Session(), engine


def _get_task_manager_status():
    """Get live status from Task Manager via socket with timeout protection."""
    try:
        client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client_socket.settimeout(3.0)  # 3 second timeout for all operations
        client_socket.connect((DEFAULT_TASK_MANAGER_HOST, DEFAULT_TASK_MANAGER_PORT))

        # Send status query
        query = {"action": "status_query"}
        client_socket.sendall(json.dumps(query).encode("utf-8"))

        # Read response with timeout
        response_data = client_socket.recv(1024)
        client_socket.close()

        if response_data:
            status_data = json.loads(response_data.decode("utf-8"))
            return {"status": "connected", "data": status_data}
        else:
            return {
                "status": "no_response",
                "error": "Task Manager connected but sent no data",
            }

    except socket.timeout:
        return {
            "status": "timeout",
            "error": "Task Manager did not respond within 3 seconds",
        }
    except ConnectionRefusedError:
        return {"status": "offline", "error": "Task Manager is not running"}
    except Exception as e:
        return {
            "status": "error",
            "error": f"Failed to connect to Task Manager: {str(e)}",
        }
