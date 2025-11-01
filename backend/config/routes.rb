Rails.application.routes.draw do
  devise_for :users
  get "welcome/index"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      devise_for :users, path: 'auth', controllers: {
        registrations: 'api/v1/auth/registrations',
        sessions: 'api/v1/auth/sessions',
      }

      devise_scope :user do
        get 'auth/:provider/callback', to: 'auth/omniauth#:provider'
      end
    end
  end

  root "welcome#index"
end
