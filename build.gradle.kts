import org.jetbrains.intellij.platform.gradle.tasks.RunIdeTask

plugins {
    id("java")
    id("org.jetbrains.intellij.platform") version "2.7.1"
    id("org.jetbrains.changelog") version "2.4.0"
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.8.0"
}

group = providers.gradleProperty("pluginGroup").get()
version = providers.gradleProperty("pluginVersion").get()

repositories {
    mavenCentral()
    intellijPlatform { defaultRepositories() }
}

dependencies {
    intellijPlatform {
        create(
            providers.gradleProperty("platformType"),
            providers.gradleProperty("platformVersion")
        )
    }
}

java { toolchain { languageVersion.set(JavaLanguageVersion.of(17)) } }

intellijPlatform {
    buildSearchableOptions = false

    pluginConfiguration {
        name.set(providers.gradleProperty("pluginName"))
        version.set(providers.gradleProperty("pluginVersion"))
        ideaVersion {
            sinceBuild.set(providers.gradleProperty("pluginSinceBuild"))
        }
    }

    signing {
        certificateChain.set(providers.environmentVariable("CERTIFICATE_CHAIN"))
        privateKey.set(providers.environmentVariable("PRIVATE_KEY"))
        password.set(providers.environmentVariable("PRIVATE_KEY_PASSWORD"))
    }

    publishing {
        token.set(providers.environmentVariable("PUBLISH_TOKEN"))
        channels.set(listOf("default"))
    }

    pluginVerification {
        ides {
            create(
                providers.gradleProperty("platformType"),
                providers.gradleProperty("platformVersion")
            )
        }
    }
}

tasks {
    withType<RunIdeTask>().configureEach { autoReload.set(true) }
}
