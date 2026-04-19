class Api::V1::FollowsController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_target_user

  def create
    follow = current_user.active_follows.find_or_initialize_by(followed: @target)

    if follow.persisted? || follow.save
      render json: follow_state_json, status: :ok
    else
      render json: {errors: follow.errors.full_messages}, status: :unprocessable_entity
    end
  end

  def destroy
    follow = current_user.active_follows.find_by(followed: @target)
    follow&.destroy
    render json: follow_state_json, status: :ok
  end

  private

  def set_target_user
    @target = User.find_by!(username: params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {error: "User not found"}, status: :not_found
  end

  def follow_state_json
    {
      is_following: current_user.following?(@target),
      followers_count: @target.followers.count,
      following_count: @target.following.count
    }
  end
end
