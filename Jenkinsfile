node('node') {
    def app

    stage('Clone repository') {
        /* Let's make sure we have the repository cloned to our workspace */

        checkout scm
    }
    
    stage('Test'){

         env.NODE_ENV = "test"

         print "Environment will be : ${env.NODE_ENV}"

         sh 'node -v'
         sh 'npm prune'
         sh 'npm install'
         sh 'npm test'

       }

    stage('Build image') {
        /* This builds the actual image; synonymous to
         * docker build on the command line */

        app = docker.build("ita/ita-testing")
    }

    // stage('Test image') {
    //     /* Ideally, we would run a test framework against our image.
    //      * For this example, we're using a Volkswagen-type approach ;-) */

    //     app.inside {
    //         sh 'echo "Tests passed"'
    //     }
    // }

    // stage('Push image') {
    //     /* Finally, we'll push the image with two tags:
    //      * First, the incremental build number from Jenkins
    //      * Second, the 'latest' tag.
    //      * Pushing multiple tags is cheap, as all the layers are reused. */
    //     docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
    //         app.push("${env.BUILD_NUMBER}")
    //         app.push("latest")
    //     }
    // }

    // // stage('Deploy'){

    // //      echo 'Push to Repo'
    // //      sh './dockerPushToRepo.sh'

    // //      echo 'ssh to web server and tell it to pull new image'
    // //      sh 'ssh deploy@xxxxx.xxxxx.com running/xxxxxxx/dockerRun.sh'

    // //    }

}