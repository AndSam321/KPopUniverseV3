class Api::V1::Auth::SessionsController < Devise::SessionsController
  include ActionController::MimeResponds
  respond_to :json
  prepend_before_action :skip_session_storage

  private

  def skip_session_storage
    request.session_options[:skip] = true
  end

  def respond_with(resource, _opts = {})
    render json: {
      success: true,
      message: 'Logged in successfully',
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
    }, status: :ok
  end

  def respond_to_on_destroy
    if request.headers['Authorization'].present?
      begin
        jwt_payload = JWT.decode(request.headers['Authorization'].split(' ').last, ENV['DEVISE_JWT_SECRET_KEY']).first
        current_user = User.find(jwt_payload['sub'])
      rescue JWT::DecodeError => e
        render json: {
          success: false,
          message: 'Invalid token'
        }, status: :unauthorized and return
      end
    end

    if current_user
      render json: {
        success: true,
        message: 'Logged out successfully'
      }, status: :ok
    else
      render json: {
        success: false,
        message: 'No active session'
      }, status: :unauthorized
    end
  end
end
