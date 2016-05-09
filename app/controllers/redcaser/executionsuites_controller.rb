# frozen_string_literal: true

class Redcaser::ExecutionsuitesController < RedcaserBaseController
  def index
    @execution_suites = ExecutionSuite.all

    render json: @execution_suites
  end

  def new
    @versions     = Version.where(project: @project).to_a
    @environments = ExecutionEnvironment.where(project: @project).to_a
    @queries      = Query.all

    render json: nil
  end
end
