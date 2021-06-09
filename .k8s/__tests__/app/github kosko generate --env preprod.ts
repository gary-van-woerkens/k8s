import { getEnvManifests } from "@socialgouv/kosko-charts/testing"
import { project } from "@socialgouv/kosko-charts/testing/fake/github-actions.env"

jest.setTimeout(1000 * 60)

test("github app: kosko generate --preprod", async () => {
  expect(
    await getEnvManifests("preprod", "", {
      ...project("myapp").preprod,
      SOCIALGOUV_CONFIG_PATH: __dirname + "/config.json",
    })
  ).toMatchSnapshot()
})
