class Api::V1::BaseController < ActionController::API
  include Pagy::Backend

  respond_to :json

  before_action :set_active_storage_url_options

  private

  def set_active_storage_url_options
    ActiveStorage::Current.url_options = {
      host: request.host,
      port: request.port,
      protocol: request.protocol
    }
  end

  def authenticate_user!
    @current_user = user_from_token
    render json: {error: "Unauthorized"}, status: :unauthorized unless @current_user
  end

  # Sets current_user when a valid token is present, but allows the request
  # through for guests (used by publicly readable endpoints).
  def set_current_user_optional
    @current_user = user_from_token
  end

  def user_from_token
    token = request.headers["Authorization"]&.split(" ")&.last
    return unless token

    payload = JWT.decode(token, ENV["DEVISE_JWT_SECRET_KEY"]).first
    User.find(payload["sub"])
  rescue JWT::DecodeError, ActiveRecord::RecordNotFound
    nil
  end

  attr_reader :current_user
end
