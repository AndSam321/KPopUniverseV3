Devise.setup do |config|
    config.jwt do |jwt|
      jwt.secret = ENV['DEVISE_JWT_SECRET_KEY']
      jwt.dispatch_requests = [
        ['POST', %r{^/api/v1/auth/sign_in$}],
        ['POST', %r{^/api/v1/auth$}]
      ]
      jwt.revocation_requests = [
        ['DELETE', %r{^/api/v1/auth/sign_out$}]
      ]
      jwt.expiration_time = 1.day.to_i
    end
  end