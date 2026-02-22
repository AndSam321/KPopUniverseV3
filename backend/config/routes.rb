Rails.application.routes.draw do
  get "welcome/index"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      devise_for :users, path: "auth",
                 defaults: { format: :json },
                 controllers: {
                   registrations: "api/v1/auth/registrations",
                   sessions: "api/v1/auth/sessions",
                   omniauth_callbacks: "api/v1/auth/omniauth"
                 }

      resources :users, only: [:show] do
        collection do
          get :my_profile
          patch :update_profile
        end
      end

      resources :posts do
        member do
          post :like
          delete :unlike
        end

        resources :comments, only: [:index, :create]
      end

      resources :groups, only: [:index, :show, :create]
      resources :comments, only: [:update, :destroy]
    end
  end

  root "welcome#index"
end
