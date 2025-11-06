class Api::V1::Auth::SessionsController < Devise::SessionsController
  include ActionController::MimeResponds
  respond_to :json
  prepend_before_action :skip_session_storage

  # Explicit login instead of relying on Devise's default create
  def create
    user = User.find_for_database_authentication(email: sign_in_params[:email])

    if user&.valid_password?(sign_in_params[:password])
      # Generate JWT token manually using devise-jwt's encoder
      token, _payload = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil)

      render json: {
        success: true,
        message: "Logged in successfully",
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            avatar_url: user.avatar_url,
            title: user.title,
            idol_points: user.idol_points
          },
          token: token
        }
      }, status: :ok
    else
      render json: {
        success: false,
        message: "Invalid email or password"
      }, status: :unauthorized
    end
  end

  private

  def skip_session_storage
    request.session_options[:skip] = true
  end

  def sign_in_params
    params.require(:user).permit(:email, :password)
  end

  def respond_to_on_destroy
    if request.headers["Authorization"].present?
      begin
        jwt_payload = JWT.decode(
          request.headers["Authorization"].split(" ").last,
          ENV["DEVISE_JWT_SECRET_KEY"]
        ).first
        current_user = User.find(jwt_payload["sub"])
      rescue JWT::DecodeError
        render json: {
          success: false,
          message: "Invalid token"
        }, status: :unauthorized and return
      end
    end

    if current_user
      render json: {
        success: true,
        message: "Logged out successfully"
      }, status: :ok
    else
      render json: {
        success: false,
        message: "No active session"
      }, status: :unauthorized
    end
  end
end
