class Api::V1::Auth::PasswordsController < Devise::PasswordsController
  respond_to :json
  prepend_before_action :skip_session_storage

  # POST /api/v1/auth/password
  def create
    User.send_reset_password_instructions(email: params.dig(:user, :email))

    # Always report success so the endpoint can't be used to discover which
    # emails have accounts.
    render json: {
      success: true,
      message: "If an account exists for that email, a reset link is on its way."
    }, status: :ok
  end

  # PUT /api/v1/auth/password
  def update
    user = User.reset_password_by_token(update_params)

    if user.errors.empty?
      render json: {success: true, message: "Your password has been reset. You can now log in."}, status: :ok
    else
      render json: {success: false, errors: user.errors.full_messages}, status: :unprocessable_entity
    end
  end

  private

  def skip_session_storage
    request.session_options[:skip] = true
  end

  def update_params
    params.require(:user).permit(:reset_password_token, :password, :password_confirmation)
  end
end
