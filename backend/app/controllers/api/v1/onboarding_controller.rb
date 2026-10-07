class Api::V1::OnboardingController < Api::V1::BaseController
  before_action :authenticate_user!

  def create
    user = OnboardingCompletion.new(user: current_user, group_ids: params[:group_ids]).call
    render json: {data: {onboarded_at: user.onboarded_at}}, status: :ok
  end
end
