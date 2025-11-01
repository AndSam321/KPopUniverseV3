class Api::V1::Auth::RegistrationsController < Devise::RegistrationsController
  include ActionController::MimeResponds
  respond_to :json
  prepend_before_action :skip_session_storage

  private

  def skip_session_storage
    request.session_options[:skip] = true
  end

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: {
        success: true,
        message: 'Signed up successfully',
        data: {
          user: {
            id: resource.id,
            email: resource.email,
            username: resource.username,
            avatar_url: resource.avatar_url,
            title: resource.title,
            idol_points: resource.idol_points
          },
          token: request.env['warden-jwt_auth.token']
        }
      }, status: :created
    else
      render json: {
        success: false,
        message: 'Sign up failed',
        errors: resource.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation, :username)
  end
end
