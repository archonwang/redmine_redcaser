require 'spec_helper'

describe SettingsController, type: :controller do
  include LoginSupport
  include SetupSupport
  render_views

  context 'logged in as admin' do
    let(:admin) { create :user, :admin }

    before :example do
      login_as admin
    end

    context 'GET #plugin without initial settigns' do
      before :example do
        create_base_setup_without_settings
        get :plugin, id: 'redmine_redcaser'
      end

      it 'responds with the plugin settings page' do
        expect(response).to have_http_status(:ok)
        expect(response).to render_template(:plugin)
      end
    end

    context 'GET #plugin with initial settigns' do
      before :example do
        create_base_setup_with_settings
        get :plugin, id: 'redmine_redcaser'
      end

      it 'responds with the plugin settings page' do
        expect(response).to have_http_status(:ok)
        expect(response).to render_template(:plugin)
      end
    end
  end
end
