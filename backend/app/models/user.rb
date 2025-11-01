class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
           :recoverable, :rememberable, :validatable, :trackable,
           :jwt_authenticatable, :omniauthable,
           jwt_revocation_strategy: JwtDenylist,
           omniauth_providers: [ :google_oauth2 ]

  validates :username, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true

  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.email = auth.info.email
      user.password = Devise.friendly_token[0, 20]
      user.username = auth.info.name&.parameterize || "user_#{SecureRandom.hex(4)}"
      user.avatar_url = auth.info.image
    end
  end

  def jwt_payload
    { "user_id" => id,
      "username" => username,
      "email" => email
    }
  end
end
