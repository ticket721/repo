#! /bin/bash

aws s3api create-bucket --bucket ticket721-staging --region eu-west-3 --create-bucket-configuration LocationConstraint=eu-west-3 --
aws s3api put-bucket-tagging --bucket ticket721-staging --tagging '{
  "TagSet": [
    {
      "Key": "cluster",
      "Value": "euw"
    }
  ]
}'
aws s3api put-bucket-policy --bucket ticket721-staging --policy '{
         "Version": "2008-10-17",
         "Statement": [
             {
                 "Sid": "AllowPublicRead",
                 "Effect": "Allow",
                 "Principal": {
                     "AWS": "*"
                 },
                 "Action": "s3:GetObject",
                 "Resource": "arn:aws:s3:::ticket721-staging/public/*"
             }
         ]
     }';
aws s3api put-object --bucket ticket721-staging --key public/
aws s3api put-bucket-cors --bucket ticket721-staging --cors-configuration '{
       "CORSRules": [
         {
           "AllowedMethods": ["GET"],
           "AllowedOrigins": ["*"]
         }
       ]
     }'


