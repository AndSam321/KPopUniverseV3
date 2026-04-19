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

  def update_notification_preferences
    prefs = current_user.notification_preferences.merge(notification_prefs_params.to_h)
    current_user.update!(notification_preferences: prefs)
    render json: {status: "success", data: user_data(current_user)}
  end

  def followers
    user = User.find_by!(username: params[:id])
    render json: {data: user.followers.map { |u| user_card(u) }}
  rescue ActiveRecord::RecordNotFound
    render json: {status: "error", message: "User not found"}, status: :not_found
  end

  def following
    user = User.find_by!(username: params[:id])
    render json: {data: user.following.map { |u| user_card(u) }}
  rescue ActiveRecord::RecordNotFound
    render json: {status: "error", message: "User not found"}, status: :not_found
  end

  private

  def user_card(user)
    {
      id: user.id,
      username: user.username,
      avatar_url: user.profile_avatar_url,
      title: user.title,
      is_following: current_user.following?(user)
    }
  end

  def profile_params
    params.permit(:bio, :avatar)
  end

  def notification_prefs_params
    params.require(:notification_preferences).permit(:likes, :comments, :replies)
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
      notification_preferences: user.notification_preferences,
      muted_group_ids: user.muted_groups.pluck(:group_id),
      followers_count: user.followers.count,
      following_count: user.following.count,
      is_following: user != current_user && current_user.following?(user),
      created_at: user.created_at
    }
  end
end
