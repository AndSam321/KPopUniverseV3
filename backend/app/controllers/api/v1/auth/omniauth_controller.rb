class Api::V1::Auth::OmniauthController < ApplicationController
  def google_oauth2
    handle_auth "Google"
  end

  private

  def handle_auth(provider)
    @user = User.from_omniauth(request.env["omniauth.auth"])

    if @user.persisted?
      # Generate JWT token
      token = generate_jwt_token(@user)

      # Redirect back to React app with token
      redirect_to "#{ENV['FRONTEND_URL']}/auth/callback?token=#{token}&provider=#{provider.downcase}", allow_other_host: true
    else
      redirect_to "#{ENV['FRONTEND_URL']}/auth/failure?message=Authentication failed", allow_other_host: true
    end
  end

  def generate_jwt_token(user)
    JWT.encode(
      {
        sub: user.id,
        user_id: user.id,
        username: user.username,
        email: user.email,
        exp: 24.hours.from_now.to_i
      },
      ENV["DEVISE_JWT_SECRET_KEY"]
    )
  end
end
