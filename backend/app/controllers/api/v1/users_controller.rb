class Api::V1::UsersController < Api::V1::BaseController
  include Devise::Controllers::Helpers

  # Routes for this:
  # GET /api/v1/users/my_profile
  # GET /api/v1/users/:id
  before_action :authenticate_user!

  def my_profile
    user = current_user
    render json: {
      status: "success",
      data: user_data(user)
    }, status: :ok
  end

  def show
    user = User.find_by!(username: params[:id])
    render json: {
      status: "success",
      data: user_data(user)
    }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: {
      status: "error",
      message: "User not found"
    }, status: :not_found
  end

  def update_profile
    if current_user.update(profile_params)
      render json: {
        status: "success",
        data: user_data(current_user)
      }, status: :ok
    else
      render json: {
        status: "error",
        errors: current_user.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  private

  def profile_params
    params.permit(:bio, :avatar)
  end

  def user_data(user)
    {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.profile_avatar_url,
      bio: user.bio,
      idol_points: user.idol_points,
      title: user.title,
      badges: user.badges,
      points_info: user.points_info,
      created_at: user.created_at
    }
  end
end
