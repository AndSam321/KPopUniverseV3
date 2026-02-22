module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      token = request.params[:token]
      if token
        payload = JWT.decode(token, ENV["DEVISE_JWT_SECRET_KEY"]).first
        User.find(payload["sub"])
      else
        reject_unauthorized_connection
      end
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      reject_unauthorized_connection
    end
  end
end
