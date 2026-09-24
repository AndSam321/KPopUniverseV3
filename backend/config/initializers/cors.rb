Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(
      %r{\Ahttp://localhost:\d+\z},
      %r{\Ahttp://127\.0\.0\.1:\d+\z},
      *Array(ENV["FRONTEND_URL"].presence)
    )

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
      expose: [ "Authorization" ]
  end
end
