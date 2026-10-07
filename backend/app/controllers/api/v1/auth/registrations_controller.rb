class Api::V1::Auth::RegistrationsController < Devise::RegistrationsController
  include ActionController::MimeResponds
  respond_to :json
  prepend_before_action :skip_session_storage
  prepend_before_action :verify_turnstile, only: [:create]

  private

  def skip_session_storage
    request.session_options[:skip] = true
  end

  def verify_turnstile
    return if TurnstileVerifier.verify(token: params[:turnstile_token], remote_ip: request.remote_ip)

    render json: {
      success: false,
      message: "Please complete the verification challenge and try again.",
      errors: ["Verification failed"]
    }, status: :unprocessable_entity
  end

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: {
        success: true,
        message: "Signed up successfully",
        data: {
          user: {
            id: resource.id,
            email: resource.email,
            username: resource.username,
            avatar_url: resource.profile_avatar_url,
            title: resource.title,
            idol_points: resource.idol_points,
            onboarded_at: resource.onboarded_at
          },
          token: request.env["warden-jwt_auth.token"]
        }
      }, status: :created
    else
      render json: {
        success: false,
        message: "Sign up failed",
        errors: resource.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation, :username)
  end
end
