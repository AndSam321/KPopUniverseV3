Rails.application.routes.draw do
  mount ActionCable.server => "/cable"

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
          patch :update_notification_preferences
        end
        member do
          post :follow, to: "follows#create"
          delete :follow, to: "follows#destroy"
          get :followers, to: "users#followers"
          get :following, to: "users#following"
        end
      end

      resources :posts do
        collection do
          get :following
        end
        member do
          post :like
          delete :unlike
        end

        resources :comments, only: [:index, :create]
      end

      get "search", to: "search#index"

      resources :groups, only: [:index, :show] do
        member do
          post :toggle_mute, controller: "muted_groups", action: "toggle"
        end
        resources :communities, only: [:index, :create]
      end

      resources :communities, only: [:show] do
        member do
          post :join
          delete :leave
        end
        collection do
          get :mine
        end
      end
      resources :comments, only: [:update, :destroy] do
        member do
          post :like
          delete :unlike
        end
      end

      resources :notifications, only: [:index] do
        collection do
          post :mark_all_read
          get :unread_count
        end
        member do
          patch :mark_read
        end
      end
    end
  end

  root "welcome#index"
end
