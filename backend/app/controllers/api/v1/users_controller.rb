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

  private

  def user_data(user)
    {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      bio: user.bio,
      idol_points: user.idol_points,
      title: user.title,
      created_at: user.created_at
    }
  end
end
