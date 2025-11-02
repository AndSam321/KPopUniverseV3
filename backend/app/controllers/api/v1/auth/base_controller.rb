class Api::V1::BaseController < ActionController::API
  respond_to :json

  before_action :configure_permitted_parameters, if: :devise_controller?

  private

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [ :username ])
    devise_parameter_sanitizer.permit(:sign_in, keys: [ :email, :password ])
  end
end
