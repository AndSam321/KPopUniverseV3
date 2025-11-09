class Api::V1::BaseController < ActionController::API
  include Pagy::Backend

  respond_to :json

  private

  def authenticate_user!
    token = request.headers["Authorization"]&.split(" ")&.last
    return render json: {error: "Unauthorized"}, status: :unauthorized unless token

    begin
      payload = JWT.decode(token, ENV["DEVISE_JWT_SECRET_KEY"]).first
      @current_user = User.find(payload["sub"])
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      render json: {error: "Unauthorized"}, status: :unauthorized
    end
  end

  attr_reader :current_user
end
