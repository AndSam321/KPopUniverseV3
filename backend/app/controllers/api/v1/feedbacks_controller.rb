class Api::V1::FeedbacksController < Api::V1::BaseController
  before_action :set_current_user_optional

  def create
    feedback = Feedback.new(message: params[:message], user: current_user)

    if feedback.save
      render json: {status: "ok"}, status: :created
    else
      render json: {errors: feedback.errors.full_messages}, status: :unprocessable_entity
    end
  end
end
