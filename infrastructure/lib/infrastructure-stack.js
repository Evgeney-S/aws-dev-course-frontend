const { Stack, CfnOutput } = require('aws-cdk-lib');
const { Bucket, BucketAccessControl } = require('aws-cdk-lib/aws-s3');
const { Distribution, ViewerProtocolPolicy } = require('aws-cdk-lib/aws-cloudfront');
const { S3BucketOrigin } = require('aws-cdk-lib/aws-cloudfront-origins');
const { BucketDeployment, Source } = require('aws-cdk-lib/aws-s3-deployment');
const path = require('path');

class InfrastructureStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const websiteBucket = new Bucket(this, 'AWSDevCourseFrontendBucket', {
      accessControl: BucketAccessControl.PRIVATE,
      enforceSSL: true,
      versioned: true,
    });

    const distribution = new Distribution(this, 'AWSDevCourseFrontendDistribution', {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    new BucketDeployment(this, 'AWSDevCourseFrontendBucketDeployment', {
      sources: [Source.asset(path.join(__dirname, '../../dist'))],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Output the CloudFront URL
    new CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'CloudFront Distribution Domain Name',
    });
  }
}

module.exports = { InfrastructureStack };
