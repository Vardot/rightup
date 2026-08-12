#!/bin/usr/env bash


## cd PROJECT_DIR_NAME/recipes/rightup/scripts
## bash add-testing-users.sh


current_path=$(pwd);
script_path=$(cd "$(dirname "$0")" && pwd);

# Find the project root by looking for the vendor directory.
project_root=$(cd "${script_path}" && while [ ! -d "vendor" ] && [ "$(pwd)" != "/" ]; do cd ..; done && pwd);
drush="${project_root}/vendor/drush/drush/drush";

# List of default testing users for Rightup.
#   "name|mail|password|role"
users=(
  "Normal user|test.authenticated@vardot.com|dD.123123ddd|_none_"
  "Content editor|test.content_editor@vardot.com|dD.123123ddd|content_editor"
  "Content admin|test.content_admin@vardot.com|dD.123123ddd|content_admin"
  "SEO admin|test.seo_admin@vardot.com|dD.123123ddd|seo_admin"
  "Site admin|test.site_admin@vardot.com|dD.123123ddd|site_admin"
  "Super admin|test.super_admin@vardot.com|dD.123123ddd|administrator"
)

cd "${project_root}/docroot" ;
for user_entry in "${users[@]}"
do
  IFS='|' read -r user_name user_mail user_password user_role <<< "${user_entry}"

  echo " ---------------------------------------------------------------- ";
  echo "      User name: ${user_name}";
  echo "      User mail: ${user_mail}";
  echo "  User password: ${user_password}";
  echo "      User role: ${user_role}";
  echo " ================================================================= ";

  ${drush} user:create "${user_name}" --mail="${user_mail}" --password="${user_password}" ;
  if [ "${user_role}" == '_none_' ] ; then
    echo "   No user role for this user" ;
  else
    ${drush} user:role:add "${user_role}" "${user_name}" ;
  fi

done
cd ${current_path};
